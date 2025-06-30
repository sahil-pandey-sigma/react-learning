import React, { useEffect, useState } from 'react'
import { deletePost, getPost } from '../api/PostApi';
import Form from './Form';

function Posts() {
    const [posts, setPosts] = useState([]);
    const [updateDataApi, setUpdateDataApi] = useState({});
    const getPostData = async () => {
        const res = await getPost();
        console.log(res.data)
        setPosts(res.data)
    };
    // Delete element
    const handleDeletePost = async (id) => {
        try {
            const res = await deletePost(id);
            let newUpdatedPosts = null;
            if (res.status >= 200 && res.status <= 299) {
                newUpdatedPosts = posts.filter((post) => post.id !== id)
            }
            setPosts(newUpdatedPosts);
        } catch (error) {
            console.error(error);
        }

    }
    // Update element 
    const handleUpdatePost = (post) => {
        setUpdateDataApi(post);
    }



    useEffect(() => {
        getPostData();
    }, []);
    return (
        <>
            <section className='section-form'>
                <Form posts={posts} setPosts={setPosts} updateDataApi={updateDataApi} setUpdateDataApi={setUpdateDataApi} />
            </section>
            <div className='section-container'>
                <section className="section-post">
                    <ol>
                        {
                            posts.map((post) => {
                                const { id, body, title } = post;
                                return <li key={id}>
                                    <div className="list-content">
                                        <div className='description'>
                                            <p>Title : {title}</p>
                                            <p >Body : {body}</p>
                                        </div>
                                        <div className="btn">
                                            <button onClick={() => handleUpdatePost(post)}>Edit</button>
                                            <button className='btn-delete' onClick={() => { handleDeletePost(id) }}>Delete</button>
                                        </div>
                                    </div>
                                </li>
                            })
                        }
                    </ol>
                </section>
            </div>

        </>
    )
}

export default Posts