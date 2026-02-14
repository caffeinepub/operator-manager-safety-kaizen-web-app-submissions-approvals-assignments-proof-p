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

module {
  type LoginId = Text;
  type HashedPassword = Text;
  type Role = { #admin; #operator; #manager };

  type Credential = {
    id : LoginId;
    password : HashedPassword;
    role : Role;
    enabled : Bool;
  };

  type OldActor = {
    credentials : Map.Map<LoginId, Credential>;
  };

  type NewActor = {
    credentials : Map.Map<LoginId, Credential>;
  };

  public func run(old : OldActor) : NewActor {
    if (old.credentials.isEmpty()) { // If empty, set default admin credentials
      let adminCredential : Credential = {
        id = "admin";
        password = "1234";
        role = #admin;
        enabled = true;
      };
      let newCredentials = Map.empty<LoginId, Credential>();
      newCredentials.add("admin", adminCredential);
      { credentials = newCredentials };
    } else { // Otherwise, keep original credentials
      { credentials = old.credentials };
    };
  };
};
