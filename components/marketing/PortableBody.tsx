/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/image";
import styles from "./PortableBody.module.scss";

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: any }) => (
      <span className={styles.img}>
        <Image
          src={urlFor(value).width(1100).url()}
          alt={value?.alt ?? ""}
          width={1100}
          height={660}
        />
      </span>
    ),
  },
};

export function PortableBody({ value }: { value: any }) {
  return (
    <div className={styles.body}>
      <PortableText value={value} components={components} />
    </div>
  );
}
