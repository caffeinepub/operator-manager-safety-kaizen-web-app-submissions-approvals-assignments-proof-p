import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // TYPES
  type LoginId = Text;
  type HashedPassword = Text;
  public type Role = { #admin; #operator; #manager };

  module KaizenStatus {
    public type KaizenStatus = { #submitted; #approved; #rejected; #assigned; #inProgress; #implemented; #closed };

    public func compare(status1 : KaizenStatus, status2 : KaizenStatus) : Order.Order {
      func statusOrder(status : KaizenStatus) : Nat {
        switch (status) {
          case (#submitted) { 0 };
          case (#approved) { 1 };
          case (#rejected) { 2 };
          case (#assigned) { 3 };
          case (#inProgress) { 4 };
          case (#implemented) { 5 };
          case (#closed) { 6 };
        };
      };
      Int.compare(statusOrder(status1), statusOrder(status2));
    };
  };
  public type KaizenStatus = KaizenStatus.KaizenStatus;

  public type UserProfile = {
    name : Text;
    role : Text; // "Operator", "Manager", etc.
  };

  type Credential = {
    id : LoginId;
    password : HashedPassword;
    role : Role;
    enabled : Bool;
  };

  type Observation = {
    id : Text;
    obsType : Text;
    title : Text;
    description : Text;
    area : ?Text;
    timestamp : Time.Time;
    submitter : Principal;
    status : Text;
  };

  module Observation {
    public func compareByTimestamp(obs1 : Observation, obs2 : Observation) : Order.Order {
      Int.compare(obs1.timestamp, obs2.timestamp);
    };
  };

  type Kaizen = {
    id : Text;
    title : Text;
    problemStatement : Text;
    improvement : Text;
    benefit : Text;
    department : ?Text;
    timestamp : Time.Time;
    submitter : Principal;
    status : KaizenStatus;
    managerComment : ?Text;
    assignedDepartment : ?Text;
    requiredTools : ?Text;
    lastUpdate : Time.Time;
  };

  type Photo = {
    id : Text;
    kaizenId : Text;
    uploader : Principal;
    timestamp : Time.Time;
    filename : Text;
    contentType : Text;
    blob : Storage.ExternalBlob;
  };

  public type OperatorActivity = {
    lastActivity : Time.Time;
    operator : Principal;
  };

  public type OperatorProfileActivity = {
    operator : Principal;
    lastActivity : Time.Time;
    name : ?Text;
    role : ?Role;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let credentials = Map.empty<LoginId, Credential>();
  let observations = Map.empty<Text, Observation>();
  let kaizens = Map.empty<Text, Kaizen>();
  let photos = Map.empty<Text, Photo>();
  let operatorActivity = Map.empty<Principal, OperatorActivity>();

  var isMaintenanceMode : Bool = false;

  // SYSTEM CREDENTIALS
  type SystemCredential = {
    id : LoginId;
    password : HashedPassword;
    role : Role;
    enabled : Bool;
  };

  // ---- CREDENTIALS MANAGEMENT ----
  // Validate credentials for login/disconnect - must be accessible to anonymous users
  public query func validateCredentials(loginId : LoginId, password : HashedPassword, selectedRole : Role) : async () {
    // Seed default admin credentials for new installations if empty
    if (credentials.isEmpty()) {
      let adminCredential : Credential = {
        id = "admin";
        password = "1234";
        role = #admin;
        enabled = true;
      };
      credentials.add("admin", adminCredential);
    };

    switch (credentials.get(loginId)) {
      case (null) {
        Runtime.trap("Invalid credentials");
      };
      case (?cred) {
        if (cred.password == password) {
          if (not cred.enabled) {
            Runtime.trap("This login id is disabled. Please contact your system administrator.");
          };
          if (cred.role != selectedRole) {
            let roleText = switch (cred.role) {
              case (#admin) { "Admin" };
              case (#manager) { "Manager" };
              case (#operator) { "Operator" };
            };
            Runtime.trap("Selected role does not match credential. Please select '" # roleText # "' to log in.");
          };
        } else {
          Runtime.trap("Invalid credentials");
        };
      };
    };
  };

  public type AuthorizationToken = {
    loginId : LoginId;
    isAdmin : Bool;
  };

  public query func authorizeAdmin(loginId : LoginId, password : HashedPassword) : async AuthorizationToken {
    // Seed default admin credentials if credentials store is empty
    if (credentials.isEmpty()) {
      let adminCredential : Credential = {
        id = "admin";
        password = "1234";
        role = #admin;
        enabled = true;
      };
      credentials.add("admin", adminCredential);
    };

    switch (credentials.get(loginId)) {
      case (null) {
        Runtime.trap("Invalid credentials");
      };
      case (?cred) {
        if (cred.role == #admin and cred.password == password) {
          if (not cred.enabled) {
            Runtime.trap("This login id is disabled. Please contact your system administrator.");
          };
          {
            loginId;
            isAdmin = true;
          };
        } else {
          Runtime.trap("Invalid or non-admin credentials");
        };
      };
    };
  };

  // Credential CRUD functions (Admin-only)
  public shared ({ caller }) func createCredentialWithToken(token : AuthorizationToken, loginId : LoginId, password : HashedPassword, role : Role, enabled : Bool) : async () {
    checkMaintenanceMode(caller);
    if (not token.isAdmin) {
      Runtime.trap("Unauthorized: Only admins can create credentials");
    };
    switch (credentials.get(loginId)) {
      case (null) {
        let newCredential : Credential = {
          id = loginId;
          password;
          role;
          enabled;
        };
        credentials.add(loginId, newCredential);
      };
      case (?_existing) {
        Runtime.trap("Credential already exists");
      };
    };
  };

  public shared ({ caller }) func resetPasswordWithToken(token : AuthorizationToken, loginId : LoginId, newPassword : HashedPassword) : async () {
    checkMaintenanceMode(caller);
    if (not token.isAdmin) {
      Runtime.trap("Unauthorized: Only admins can reset passwords");
    };
    switch (credentials.get(loginId)) {
      case (null) {
        Runtime.trap("Credential does not exist");
      };
      case (?cred) {
        credentials.add(loginId, { cred with password = newPassword });
      };
    };
  };

  public shared ({ caller }) func setCredentialStatusWithToken(token : AuthorizationToken, loginId : LoginId, enabled : Bool) : async () {
    checkMaintenanceMode(caller);
    if (not token.isAdmin) {
      Runtime.trap("Unauthorized: Only admins can set credential status");
    };
    switch (credentials.get(loginId)) {
      case (null) {
        Runtime.trap("Credential does not exist");
      };
      case (?cred) {
        credentials.add(loginId, { cred with enabled });
      };
    };
  };

  /////////////////////////////////////////////////////////////////////////////
  // Maintenance Mode
  /////////////////////////////////////////////////////////////////////////////
  public query ({ caller }) func getMaintenanceMode() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check maintenance mode");
    };
    isMaintenanceMode;
  };

  public shared ({ caller }) func setMaintenanceMode(enabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can switch maintenance mode");
    };
    isMaintenanceMode := enabled;
  };

  /////////////////////////////////////////////////////////////////////////////
  // User Profile Management
  /////////////////////////////////////////////////////////////////////////////
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkMaintenanceMode(caller);
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /////////////////////////////////////////////////////////////////////////////
  // Observation Logic
  /////////////////////////////////////////////////////////////////////////////
  public shared ({ caller }) func submitObservation(obsType : Text, title : Text, description : Text, area : ?Text) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit observations");
    };
    let id = title.concat(Time.now().toText());
    let observation : Observation = {
      id;
      obsType;
      title;
      description;
      area;
      timestamp = Time.now();
      submitter = caller;
      status = "open";
    };
    observations.add(id, observation);
    updateOperatorActivity(caller);
  };

  public query ({ caller }) func getObservationsByType(obsType : Text) : async [Observation] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view observations");
    };
    observations.values().toArray().filter(func(o) { o.obsType == obsType });
  };

  public query ({ caller }) func getObservationsByDate(start : Time.Time, end : Time.Time) : async [Observation] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view observations");
    };
    observations.values().toArray().filter(func(o) { o.timestamp >= start and o.timestamp <= end });
  };

  public query ({ caller }) func getObservation(id : Text) : async Observation {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view observations");
    };
    switch (observations.get(id)) {
      case (null) { Runtime.trap("Observation does not exist") };
      case (?observation) { observation };
    };
  };

  public shared ({ caller }) func submitKaizen(title : Text, problemStatement : Text, improvement : Text, benefit : Text, department : ?Text) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit kaizens");
    };
    let id = title.concat(Time.now().toText());
    let kaizen : Kaizen = {
      id;
      title;
      problemStatement;
      improvement;
      benefit;
      department;
      timestamp = Time.now();
      submitter = caller;
      status = #submitted;
      managerComment = null;
      assignedDepartment = null;
      requiredTools = null;
      lastUpdate = Time.now();
    };
    kaizens.add(id, kaizen);
    updateOperatorActivity(caller);
  };

  /////////////////////////////////////////////////////////////////////////////
  // Kaizen Management Workflow
  /////////////////////////////////////////////////////////////////////////////
  public shared ({ caller }) func approveKaizen(kaizenId : Text, comment : Text) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve kaizens");
    };
    switch (kaizens.get(kaizenId)) {
      case (null) { Runtime.trap("Kaizen does not exist") };
      case (?kaizen) {
        if (kaizen.status != #submitted) {
          Runtime.trap("Kaizen must be in submitted status to approve");
        };
        kaizens.add(kaizenId, {
          kaizen with
          status = #approved;
          managerComment = ?comment;
          lastUpdate = Time.now();
        });
      };
    };
  };

  public shared ({ caller }) func rejectKaizen(kaizenId : Text, reason : Text) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject kaizens");
    };
    switch (kaizens.get(kaizenId)) {
      case (null) { Runtime.trap("Kaizen does not exist") };
      case (?kaizen) {
        if (kaizen.status != #submitted) {
          Runtime.trap("Kaizen must be in submitted status to reject");
        };
        kaizens.add(kaizenId, {
          kaizen with
          status = #rejected;
          managerComment = ?reason;
          lastUpdate = Time.now();
        });
      };
    };
  };

  public shared ({ caller }) func assignDepartment(kaizenId : Text, department : Text, tools : Text) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign department");
    };
    switch (kaizens.get(kaizenId)) {
      case (null) { Runtime.trap("Kaizen does not exist") };
      case (?kaizen) {
        if (kaizen.status != #approved) {
          Runtime.trap("Kaizen must be approved before assignment");
        };
        kaizens.add(kaizenId, {
          kaizen with
          status = #assigned;
          assignedDepartment = ?department;
          requiredTools = ?tools;
          lastUpdate = Time.now();
        });
      };
    };
  };

  public shared ({ caller }) func updateKaizenStatus(kaizenId : Text, newStatus : KaizenStatus) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update kaizen status");
    };
    switch (kaizens.get(kaizenId)) {
      case (null) { Runtime.trap("Kaizen does not exist") };
      case (?kaizen) {
        // Validate status transitions
        let validTransition = switch (kaizen.status, newStatus) {
          case (#assigned, #inProgress) { true };
          case (#inProgress, #implemented) { true };
          case (#implemented, #closed) { true };
          case _ { false };
        };
        if (not validTransition) {
          Runtime.trap("Invalid status transition");
        };
        kaizens.add(kaizenId, {
          kaizen with
          status = newStatus;
          lastUpdate = Time.now();
        });
      };
    };
  };

  /////////////////////////////////////////////////////////////////////////////
  // Photo Uploading
  /////////////////////////////////////////////////////////////////////////////
  public shared ({ caller }) func uploadPhoto(kaizenId : Text, filename : Text, contentType : Text, blob : Storage.ExternalBlob) : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload photos");
    };
    switch (kaizens.get(kaizenId)) {
      case (null) { Runtime.trap("Kaizen does not exist") };
      case (?kaizen) {
        // Only allow photo upload for implemented or closed kaizens
        if (kaizen.status != #implemented and kaizen.status != #closed) {
          Runtime.trap("Photos can only be uploaded for implemented kaizens");
        };
      };
    };
    let id = timestampedId(filename);
    let photo : Photo = {
      id;
      kaizenId;
      uploader = caller;
      timestamp = Time.now();
      filename;
      contentType;
      blob;
    };
    photos.add(id, photo);
  };

  public query ({ caller }) func getPhotosForKaizen(kaizenId : Text) : async [Photo] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view photos");
    };
    photos.values().toArray().filter(func(p) { p.kaizenId == kaizenId });
  };

  /////////////////////////////////////////////////////////////////////////////
  // Activity & Analytics
  /////////////////////////////////////////////////////////////////////////////
  public shared ({ caller }) func pingActivity() : async () {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can ping activity");
    };
    updateOperatorActivity(caller);
  };

  public query ({ caller }) func getInactiveOperators(days : Int) : async [OperatorActivity] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access inactivity data");
    };
    let threshold = Time.now() - (days * 24 * 60 * 60 * 1_000_000_000);
    operatorActivity.values().toArray().filter(func(activity) { activity.lastActivity < threshold });
  };

  public query ({ caller }) func getKaizensByStatus(status : KaizenStatus) : async [Kaizen] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view kaizens");
    };
    kaizens.values().toArray().filter(func(k) { k.status == status });
  };

  public query ({ caller }) func getAllKaizens() : async [Kaizen] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view kaizens");
    };
    kaizens.values().toArray();
  };

  public query ({ caller }) func getKaizen(id : Text) : async Kaizen {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view kaizens");
    };
    switch (kaizens.get(id)) {
      case (null) { Runtime.trap("Kaizen does not exist") };
      case (?kaizen) { kaizen };
    };
  };

  public query ({ caller }) func getAllObservations() : async [Observation] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view observations");
    };
    observations.values().toArray();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Admin-only Operator Activity Report
  /////////////////////////////////////////////////////////////////////////////
  public query ({ caller }) func getAllOperatorActivity() : async [OperatorProfileActivity] {
    checkMaintenanceMode(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access full operator activity");
    };

    let results = List.empty<OperatorProfileActivity>();

    for ((principal, activity) in operatorActivity.entries()) {
      let profile = userProfiles.get(principal);
      let result : OperatorProfileActivity = {
        operator = principal;
        lastActivity = activity.lastActivity;
        name = switch (profile) {
          case (null) { null };
          case (?p) { ?p.name };
        };
        role = switch (profile) {
          case (null) { null };
          case (?p) { null };
        };
      };
      results.add(result);
    };

    results.toArray();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Helper Functions
  /////////////////////////////////////////////////////////////////////////////
  func checkMaintenanceMode(caller : Principal) {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin) { () }; // Admins are always allowed.
      case (#user) {
        if (isMaintenanceMode) {
          Runtime.trap("Application is undergoing maintenance. Please try again later. Admins can bypass this check.");
        };
      };
      case (#guest) {
        if (isMaintenanceMode) {
          Runtime.trap("Maintenance mode is enabled. Please try again later.");
        };
      };
    };
  };

  func updateOperatorActivity(principal : Principal) {
    operatorActivity.add(principal, { lastActivity = Time.now(); operator = principal });
  };

  func timestampedId(base : Text) : Text {
    base.concat(Time.now().toText());
  };
};
