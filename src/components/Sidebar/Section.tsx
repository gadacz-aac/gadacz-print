import { type ReactNode } from "react";
import styles from "./Sidebar.module.css";

function Section({
  title,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionHeader}>{title}</h4>
      <div>{children}</div>
    </div>
  );
}

export default Section;
