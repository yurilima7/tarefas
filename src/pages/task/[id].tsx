import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { db } from "../../services/firebase_connection";
import { collection, query, where, doc, getDoc , addDoc, getDocs, deleteDoc} from "firebase/firestore";
import { Textarea } from '@/components/textarea/textarea';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useSession } from "next-auth/react";
import { FaTrash, } from "react-icons/fa";

interface TaskProps {
    item: {
        tarefa: string;
        created: string;
        public: boolean;
        user: string;
        id: string;
    };
    allComments: CommentsProps[]
}

interface CommentsProps {
    id: string;
    comment: string;
    user: string;
    taskId: string;
    name: string;
}

export default function Task({ item, allComments }: TaskProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [comments, setComments] = useState<CommentsProps[]>(allComments || []);

    async function registerComment(event: FormEvent) {
        event.preventDefault();
        
        if (input === '') return;

        if (!session?.user?.email || !session?.user?.name) return;
        
        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.id,
            });

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.id,
            };

            setComments((oldItems) => [...oldItems, data]);
            
            setInput("");
        } catch (error) {
            console.log(error);
        }
    }


    async function deleteComment(id: string) {
        try {
            const docRef = doc(db, "comments", id);
            await deleteDoc(docRef);

            const deleteComment = comments.filter((item) => item.id !== id);

            setComments(deleteComment);
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Detalhes da tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>

                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentário</h2>

                <form onSubmit={registerComment} >
                    <Textarea value={input} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                        placeholder="Digite seu comentário..."
                    />

                    <button disabled={!session?.user} className={styles.button}>
                        Enviar comentário
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos os comentários</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentário foi encontrado</span>
                )}

                {comments.map((item) => (
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentLabel}>{item.name}</label>

                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={() => deleteComment(item.id)}>
                                    <FaTrash size={18} color="#EA3140"/>
                                </button>
                            )}
                        </div>

                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "tarefas", id);

    const snapshot = await getDoc(docRef);

    const q = query(collection(db, "comments"), where("taskId", "==", id));
    const snapshotComments = await getDocs(q);

    let allComments: CommentsProps[] = [];

    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
        });
    });

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const milliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(milliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        id: id,
    }

    return {
        props: {
            item: task,
            allComments: allComments,
        }
    }
}