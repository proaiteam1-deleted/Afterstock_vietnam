import { BoardListPage } from "@/components/boards/board-list-page";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "게시판",
};

export default function BoardsPage() {
  return (
    <AppShell>
      <BoardListPage />
    </AppShell>
  );
}
