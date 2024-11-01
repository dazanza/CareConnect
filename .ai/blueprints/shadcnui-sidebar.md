The latest documentation for the sidebar component from Shadcn provides comprehensive guidance on installation, structure, and usage of the sidebar, which is designed to be composable, themeable, and customizable. Here are the key details:
Installation
To install the sidebar component, run the following command:
bash
npx shadcn@latest add sidebar

If the colors are not automatically added to your CSS file, you should manually include the following CSS variables:
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
    
    .dark {
      --sidebar-background: 240 5.9% 10%;
      --sidebar-foreground: 240 4.8% 95.9%;
      --sidebar-primary: 224.3 76.3% 48%;
      --sidebar-primary-foreground: 0 0% 100%;
      --sidebar-accent: 240 3.7% 15.9%;
      --sidebar-accent-foreground: 240 4.8% 95.9%;
      --sidebar-border: 240 3.7% 15.9%;
      --sidebar-ring: 217.2 91.2% 59.8%;
    }
}

Structure
The sidebar component consists of several parts:
SidebarProvider: Manages the collapsible state.
Sidebar: The main container for the sidebar.
SidebarHeader and SidebarFooter: Sticky elements at the top and bottom.
SidebarContent: Contains scrollable content.
SidebarGroup: Sections within the content.
SidebarTrigger: Button to toggle the sidebar.
Basic Usage Example
To create a basic collapsible sidebar, you can set up your layout as follows:
javascript
import { SidebarProvider } from "@/components/ui/sidebar";
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

Creating Your First Sidebar
You can create a new sidebar component in components/app-sidebar.tsx:
javascript
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent />
        </Sidebar>
    );
}

Adding a Menu
To add a menu to your sidebar, you can utilize the SidebarMenu component:
javascript
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
    { title: "Home", url: "#", icon: Home },
    { title: "Inbox", url: "#", icon: Inbox },
    { title: "Calendar", url: "#", icon: Calendar },
    { title: "Search", url: "#", icon: Search },
    { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

This documentation serves as a foundation for building customizable sidebars in applications using Shadcn's UI components