import { type ReactNode } from "react";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

export default function Section({
  title,
  children,
  grid = false,
}: {
  title?: string;
  children: ReactNode;
  grid?: boolean;
}) {
  return (
    <div
      className={clsx(styles.section, {
        [styles.sectionGrid]: grid,
      })}
    >
      {title && <h4 className={styles.sectionHeader}>{title}</h4>}
      <div>{children}</div>
    </div>
  );
}
