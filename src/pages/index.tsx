import React from "react";
import { toast } from "react-hot-toast";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import PageLayout from "~/components/layout";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

//* =============================================
//*             CREATE POST WIZARD              =
//*==============================================
function CreatePostWizard() {
  const [input, setInput] = React.useState("");
  const { user } = useUser();
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      const errMsg = err.data?.zodError?.fieldErrors?.content;
      if (errMsg && errMsg[0]) {
        toast.error(errMsg[0]);
        return;
      }
      toast.error("Failed to post! Please try again.");
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full items-center gap-x-3">
      <Image
        src={user.profileImageUrl}
        alt={`${user.username || "User"}'s profile image`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !!input) {
            e.preventDefault();
            mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {!!input && !isPosting && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          Post
        </button>
      )}
      {isPosting && <LoadingSpinner size={20} />}
    </div>
  );
}

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
function PostsFeed() {
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

//* =============================================
//*                 HOME PAGE                   =
//*==============================================
const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // Start fetching post data ASAP
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-b-slate-400 p-4">
        {!isSignedIn ? (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        ) : (
          <CreatePostWizard />
        )}
      </div>
      <PostsFeed />
    </PageLayout>
  );
};

export default Home;
