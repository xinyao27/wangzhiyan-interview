import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ConversationList } from "./conversation-list";

interface SidebarProps {
  defaultOpen?: boolean;
}

export function Sidebar({ defaultOpen = false }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet defaultOpen={defaultOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <ConversationList />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-[300px] border-r h-full">
        <ConversationList />
      </div>
    </>
  );
}
