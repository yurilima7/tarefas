import { HTMLProps } from "react";
import styles from "./styles_textarea.module.css";

export function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
    return <textarea className={styles.textarea} {...rest}></textarea>
}