The new ShadcnUI Sidebar component is designed to be composable, themeable, and customizable, making it suitable for various applications. Below is a summary of its documentation:
Installation
To install the sidebar component, run the following command:
bash
npx shadcn@latest add sidebar

If the installation does not automatically add the necessary CSS colors, you can manually add them to your CSS file:
css
@layer base {
:root {
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}
.dark {
  --sidebar-background: 240 5.9% 10%;
}
}

Structure
The sidebar is composed of several key components:
SidebarProvider: Manages the collapsible state.
Sidebar: The main container for the sidebar.
SidebarHeader and SidebarFooter: Sticky elements at the top and bottom.
SidebarContent: Contains scrollable content.
SidebarGroup: Sections within the content.
SidebarTrigger: Button to toggle the sidebar.
Basic Usage Example
To create a basic collapsible sidebar, use the following structure:
javascript
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    );
}

Creating a Sidebar Component
Create a new sidebar component in components/app-sidebar.tsx:
javascript
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent />
        </Sidebar>
    );
}

Adding Menu Items
You can add menu items using SidebarMenu within a SidebarGroup:
javascript
import { Calendar, Home, Inbox } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

const items = [
    { title: "Home", url: "#", icon: Home },
    { title: "Inbox", url: "#", icon: Inbox },
    { title: "Calendar", url: "#", icon: Calendar },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

Component Props
SidebarProvider Props
Name	Type	Description
defaultOpen	boolean	Default open state of the sidebar.
open	boolean	Controlled open state of the sidebar.
setOpen	function	Function to set open state.
Sidebar Props
Property	Type	Description
side	"left" or "right"	Position of the sidebar.
variant	"sidebar", "floating", "inset"	Type of sidebar layout.
collapsible	"offcanvas", "icon", or "none"	Collapsible behavior.