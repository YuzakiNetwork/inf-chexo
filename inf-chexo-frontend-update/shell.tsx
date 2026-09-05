import { Header } from './header';
import { Footer } from './footer';

export function Shell({ children }: { children: React.ReactNode }) {
  return <><Header /><main>{children}</main><Footer /></>;
}
