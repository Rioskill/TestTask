import { useEffect, useState } from 'react';
import { range, isEmpty } from './utils';
import './App.css'

interface PostParams {
  title: string,
  content: string,
  author_username?: string
}

interface Author {
  id: number,
  username: string
}

const Post = ({title, content, author_username}: PostParams) => {
  return (
    <div className="post">
      <div className="post__header">
        <div className="post__header__avatar-container">
          <img className="post__header__avatar" src='./assets/avatar.png'/>
        </div>
        <div className="post__header__username">
          {author_username}
        </div>
      </div>
      <hr/>
      <h2 className="post__title">{title}</h2>
      <p className="post__content">
        {content}
      </p>
    </div>
  )
}


const App = () => {
  const [posts, setPosts] = useState<PostParams[]>([]);
  const [lastId, setLastId] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [hasError, setError] = useState<boolean>(false);
  const [authors, setAuthors] = useState<Author[]>([]);

  const fetchAuthor = async (id: number) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    const data = await response.json();
    return {
      id: data.id,
      username: data.username
    }
  }

  const pageSize = 5;

  const updateLastId = () => {
    setLastId(lastId + pageSize);
  }

  const fetchData = async () => {

    const fetchPage = async () => {
      if (hasError) 
        return [];

      return Promise.all(range(lastId, lastId + pageSize).map(i => 
        fetch(`https://jsonplaceholder.typicode.com/posts/${i}`)
          .then(response => response.json())
          .catch(err => {console.error('err'); setError(true); return err}, )
      ));
    }
  
    try {
      setLoading(true);
      const data = (await fetchPage()).filter(obj => !isEmpty(obj));

      if (data.length === 0) {
        setError(true);
      }

      updateLastId();

      const local_author_ids = authors.map(author => author.id);

      const new_authors_promise = data.map(post => post.userId)
                               .filter(id => !local_author_ids.includes(id))
                               .map(id => fetchAuthor(id));

      const new_authors = await Promise.all(new_authors_promise);

      setAuthors(old_authors => [...old_authors, ...new_authors]);

      setPosts(oldPosts => ([...oldPosts, ...data.map(item => ({
        title: item.title,
        content: item.body,
        author_username: [...authors, ...new_authors].find(author => item.userId === author.id)?.username
      }))]));
    } catch (error) {
      console.error(error)
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if ((window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight 
        || isLoading) && !hasError) {
      return;
    }
    fetchData();
  };

  useEffect(() => {
    if (!hasError)
      fetchData();
  }, [hasError]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasError]);

  return (
    <>
      <header>Тестовое задание @Скворцов Никита</header>
      <div className="post-container">
        {
          posts.map((post, i) => {
            return (
              <Post 
                key={i} 
                title={post.title}
                content={post.content}
                author_username={post.author_username}
              />
            )
          })
        }
        {
          !hasError && isLoading && <div className="loader"></div>
        }
        {
          hasError  && <div className="error">Постов больше нет</div>
        }
        <div id="background-pattern"/>
      </div>
    </>
  )
}

export default App
