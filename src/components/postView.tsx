import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { LoadingPage } from "~/components/Loading";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

//* =============================================
//*             POST WITH USER                  =
//*==============================================
type PostViewProps = RouterOutputs["posts"]["getAll"][number];

export function PostView({ author, post }: PostViewProps) {
  return (
    <div
      key={post.id}
      className="flex w-full gap-x-3 border-b border-slate-400 p-4"
    >
      <Image
        src={author.profileImageUrl}
        alt={`${author.username}'s profile image`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <p className="text-slate-400">
          <Link href={`/@${author.username}`}>
            <span className="text-slate-50">@{author.username}</span>
          </Link>{" "}
          <Link href={`/post/${post.id}`}>
            <span>·</span> <span>{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </p>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
}

//* =============================================
//*                 POSTS FEED                  =
//*==============================================
export function PostsFeed() {
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong!</div>;

  return (
    <div className="flex flex-col">
      {data.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
}
