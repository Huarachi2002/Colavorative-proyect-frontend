import Image from "next/image";
import styles from "./Avatar.module.css";

type Props = {
  src: string;
  name: string;
  otherStyles?: string;
};

export function Avatar({ src, name, otherStyles }: Props) {
  return (
    <div className={`${styles.avatar} ${otherStyles} w-9`} data-tooltip={name}>
      <Image src={src} fill className={styles.avatar_picture} alt={name} />
    </div>
  );
}
