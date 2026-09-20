import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Shell({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
