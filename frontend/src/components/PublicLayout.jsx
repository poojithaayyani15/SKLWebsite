import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="App bg-background">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
