import React, { useEffect, useState } from 'react'
import { postData, updateData } from '../api/PostApi';

function Form({ posts, setPosts, updateDataApi, setUpdateDataApi }) {
    const [addData, setAddData] = useState({
        title: "",
        body: "",
    });
    let isEditable = Object.keys(updateDataApi).length !== 0;
    // Now what we'll be doing that on updateDataApi we will change put the data from updateDataApi in addData
    useEffect(() => {
        updateDataApi && setAddData(
            {
                ...updateDataApi,
                title: updateDataApi.title || "",
                body: updateDataApi.body || ""
            }
        )
    }, [updateDataApi])


    const handleChange = (e) => {
        const name = e.target.name;
        // name will be either title or body
        const value = e.target.value;
        setAddData((prev) => {
            return {
                ...prev, [name]: value,
            }
        })

    }
    const addPostData = async () => {
        const res = await postData(addData);
        console.log(res)
        if (res.status >= 200 && res.status <= 299) {
            setPosts([...posts, res.data])
            setAddData({ title: "", body: "" })
        }

    }
    const updatePostData = async () => {
        try {
            const res = await updateData(addData.id, addData);
            // console.log(res);
            // console.log(res.data);
            setPosts((post) => {
                return post.map((currElem) => {
                    return currElem.id === res.data.id ? res.data : currElem;
                })
            })
        } catch (error) {
            console.error(error);

        }


    }
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEditable) {
            updatePostData();
            setUpdateDataApi({});
        }
        else {

            if (addData.title === "") {
                return
            }
            else addPostData();
        }
    }

    return (
        <form onSubmit={handleFormSubmit}>
            <div>
                <label htmlFor="title">
                </label>
                <input type="text"
                    autoComplete='off'
                    id='title'
                    name='title'
                    placeholder='Add Title'
                    value={addData.title}
                    onChange={handleChange} />

            </div>
            <div>
                <label htmlFor="body"></label>
                <input type="text"
                    autoComplete='off'
                    placeholder='Add Post'
                    id='body'
                    name='body'
                    value={addData.body}
                    onChange={handleChange} />

            </div>
            <button type='submit'>{isEditable ? "EDIT" : "ADD"}</button>

        </form>
    )
}

export default Form