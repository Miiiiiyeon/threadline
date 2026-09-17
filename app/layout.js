import "./globals.css";
import { CartProvider } from "../components/CartContext";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Threadline — Clothing",
  description: "A simple clothing brand e-commerce demo built for a university project."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main className="container-page py-8 min-h-[70vh]">{children}</main>
          <footer className="border-t border-black/10 mt-16 py-8 text-center text-xs text-black/50">
            Threadline — student project demo. Payments run in eSewa sandbox mode only.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
