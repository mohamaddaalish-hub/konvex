import { useI18n } from "@/i18n/use-i18n";
import "@/components/admin/admin.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  const { t: tr, locale, n: fmtNumber, path: localizedPath } = useI18n();
  return children;
}
