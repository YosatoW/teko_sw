import type {Express, Request, Response} from 'express'
import ollama from 'ollama'

export const initializeAPI = (app: Express) => {
    let posts = [
        {id: 1, content: 'first post'},
        {id: 2, content: 'second post'},
        {id: 3, content: 'thirdt post'},
    ]

app.get('/api/posts', (req: Request, res: Response) =>{
    res.send(posts)
})

app.post('/api/posts', (req: Request, res: Response) => {
    const newPost = {
        id: posts[posts.length - 1].id + 1,
        ...req.body
    };
    posts.push(newPost);
    res.send(newPost);
});

app.put('/api/posts/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const existingPost = posts.find((post) => post.id === id);
    if (!existingPost) {
        res.status(404).send('Post not found');
        return;
    }
    const updatedPost = {
        id: id,
        ...req.body
    };
    posts = posts.map((post) => (post.id === id ? updatedPost : post));
    res.send(updatedPost);
});

app.delete('/api/posts/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const existingPost  = posts.find((post) => post.id === id);

    if (!existingPost) {
        res.status(404).send('Post not found');
        return;
    }
    
    posts = posts.filter((post) => post.id !== id)
    res.send(posts)
})

// Testen mit Ollama
app.get('/api/posts/generate', async (req: Request, res: Response) => {
    const response = await ollama.chat({
        model: 'llama3.2:1b',
        // model: 'deepseek-r1:1.5b',
        messages: [{ role: 'user', content: 'Generieren eines zufälligen Twitter-Posts'
        }],
    })

    const content = response.message.content
    const nextId = posts[posts.length - 1].id + 1
    posts.push({ id: nextId, content })
    res.send(posts[posts.length - 1])
})
}