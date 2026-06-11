import { ImageUploadPlaceholder } from "@/components/community/image-upload-placeholder";
import { PredictorBadge } from "@/components/community/predictor-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/types";

type CommunitySidebarProps = {
  users: User[];
};

export function CommunitySidebar({ users }: CommunitySidebarProps) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>User accuracy badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <PredictorBadge key={user.id} user={user} />
          ))}
        </CardContent>
      </Card>

      <ImageUploadPlaceholder />
    </div>
  );
}
