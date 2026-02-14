import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetPhotosForKaizen } from '../../hooks/useQueries';
import { format } from 'date-fns';
import { Image as ImageIcon } from 'lucide-react';

interface KaizenPhotoGalleryProps {
  kaizenId: string;
}

export default function KaizenPhotoGallery({ kaizenId }: KaizenPhotoGalleryProps) {
  const { data: photos, isLoading } = useGetPhotosForKaizen(kaizenId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Implementation Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading photos...</p>
        </CardContent>
      </Card>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Implementation Photos</CardTitle>
          <CardDescription>No photos uploaded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementation Photos</CardTitle>
        <CardDescription>{photos.length} photo(s) uploaded</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border rounded-lg overflow-hidden">
              <img
                src={photo.blob.getDirectURL()}
                alt={photo.filename}
                className="w-full h-48 object-cover"
              />
              <div className="p-3 bg-muted/50">
                <p className="text-sm font-medium truncate">{photo.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(Number(photo.timestamp) / 1000000), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
