const express = require('express');
const { posts } = require('../data');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json(posts);
});

router.post('/', (req, res) => {
  const post = {
    id: String(posts.length + 1),
    authorId: req.user.id,
    title: req.body?.title ?? 'Untitled',
    hidden: false,
  };
  posts.push(post);
  return res.status(201).json(post);
});

router.patch('/:id', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post not found' } });
  }

  const isOwner = post.authorId === req.user.id;
  const isPrivileged = ['moderator', 'admin'].includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  post.title = req.body?.title ?? post.title;
  return res.status(200).json(post);
});

router.delete('/:id', (req, res) => {
  const idx = posts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post not found' } });
  }

  const post = posts[idx];
  const isOwner = post.authorId === req.user.id;
  const isPrivileged = ['moderator', 'admin'].includes(req.user.role);
  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  posts.splice(idx, 1);
  return res.status(200).json({ ok: true });
});

router.post('/:id/hide', requireRole('moderator', 'admin'), (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post not found' } });
  post.hidden = true;
  return res.status(200).json(post);
});

module.exports = router;
