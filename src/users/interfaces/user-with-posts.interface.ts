import { Post, User } from '@prisma/client';

type UserWithPosts = User & { posts: Post[] };
