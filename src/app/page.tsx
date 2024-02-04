"use client"
import Image from "next/image";
import styles from "./page.module.scss";
import { useLayoutEffect, useRef } from 'react';
import { useEffect, useState } from "react";
import { MouseEvent } from 'react';

// TypeScript types
type Post = {
  "userId": number,
  "id": number,
  "title": string,
  "body": string
}

export default function Home() {
  const [initPosts, setInitPosts] = useState([])
  const [posts, setPosts] = useState<any[]>([]);
  const [forceRender, setForceRender] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [isAscSort, setIsAscSort] = useState(true);
  const [sortField, setSortField] = useState<string>('title');

  const inputRef = useRef<any>(null);
  const pagesPerView = 6;

  // Fetch data and call setStates after component is mounted
  useEffect(() => {
    sortPosts(posts);
    const fetchData = async () => {
      if(initPosts.length == 0) {
        fetch('https://jsonplaceholder.typicode.com/posts')
          .then((res) => res.json())
          .then((json) => {
            setInitPosts(json);
            setPosts(json);
          })
      }
  }
  fetchData();
  })
 
  
  const sortOnClick = async (sortField: string, e: MouseEvent) => {
    setIsAscSort(!isAscSort);
    setSortField(sortField);
    changeIcon(e)
  }

  // Filter, sort data and reset current page to 1.
  const processData = () => {
    const filteredPosts = filterPostsByTitle();
    sortPosts(filteredPosts)
    setPosts(filteredPosts)
    setCurrentPage(1)
  }

  const filterPostsByTitle = () => posts.filter((post: Post) => post["title"].includes(inputRef.current.value));

  // Sort Data by current sorting order
  const sortPosts = (data: Array<Post>) => {
    if(isAscSort === true) {
      data.sort(function (first: Post, second: Post): number {
        if (first[sortField as keyof Post] > second[sortField as keyof Post]) return 1;
        if (first[sortField as keyof Post] < second[sortField as keyof Post]) return -1;
        return 0;
      })
    }

    else if(isAscSort === false) {
      data.sort(function (first, second) {
        if (first[sortField as keyof Post] > second[sortField as keyof Post]) return -1;
        if (first[sortField as keyof Post] < second[sortField as keyof Post]) return 1;
        return 0;
      })
    }
  }
  const changeIcon = (e: MouseEvent) => {

    let elems = Array.from(document.getElementsByClassName(styles.sort_btn));

    switch(e.currentTarget.innerHTML) {
      case "■":
        elems.forEach(elem => elem.innerHTML = "■")
        e.currentTarget.innerHTML = "▼";
        break;
      case "▲":
        e.currentTarget.innerHTML = "▼";
        break;
      case "▼":
        e.currentTarget.innerHTML = "▲";
        break;
    }

  }

  // Why here? Cause it sorts array and won't display any changes if i'll use this in useEffect
  sortPosts(posts);
  
  return (
    <main>
      <div className={styles.smart_table}>
        <div className={styles.search}>
          <input placeholder="Поиск по названию" ref={inputRef} type="text" id="search_text" />
          <input type="submit" value="Поиск" onClick={processData} />
        </div>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td><span className={styles.column_name}>ID пользователя </span><span className={styles.sort_btn} onClick={(e) => {sortOnClick('userId', e)}}>■</span></td>
              <td><span className={styles.column_name}>ID Записи </span><span className={styles.sort_btn} onClick={(e) => {sortOnClick('id', e)}}>■</span></td>
              <td><span className={styles.column_name}>Название поста </span><span className={styles.sort_btn} onClick={(e) => {sortOnClick('title', e)}}>▲</span></td>
              <td><span className={styles.column_name}>Текст поста </span><span className={styles.sort_btn} onClick={(e) => {sortOnClick('body', e)}}>■</span></td>
            </tr>
            {
            // Render all current page elements
            posts.map((item, index) => {
              const minElem = (pagesPerView * currentPage) - pagesPerView;
              const maxElem = pagesPerView * currentPage;

              if(index >= minElem && index < maxElem) {
                return (
                  <tr key={index}>
                    <td>{item.userId}</td>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.body}</td>
                  </tr>
                )
              }
            }
              )}
          </tbody>
        </table>
        <ul className={styles.pagination}>
        
        {
          // Render all page numbers
          Array.from(Array(Math.ceil(posts.length / pagesPerView)).keys(),
        (n) => {
          if(currentPage === n+1) return <li className={styles.item + ' ' + styles.active} key={n + 1} onClick={() => setCurrentPage(n + 1)}>{n + 1}</li>;
          else return <li className={styles.item} key={n + 1} onClick={() => setCurrentPage(n + 1)}>{n + 1}</li>;
          } )
          }
        </ul>
      </div>
    </main>
  );
}
