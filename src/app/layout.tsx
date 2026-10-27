// import { Outfit } from 'next/font/google';
// import './globals.css';
// import "flatpickr/dist/flatpickr.css";
// import { SidebarProvider } from '@/context/SidebarContext';
// import { ThemeProvider } from '@/context/ThemeContext';

// const outfit = Outfit({
//   subsets: ["latin"],
// });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${outfit.className} dark:bg-gray-900`}>
//         <ThemeProvider>
//           <SidebarProvider>{children}</SidebarProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { getCurrentUser } from '@/lib/session';

const outfit = Outfit({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user session directly on the server via session.ts
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <UserProvider user={user}>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}