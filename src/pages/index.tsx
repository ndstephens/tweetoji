import React from "react";
import { toast } from "react-hot-toast";
import { type NextPage } from "next";
import Image from "next/image";

import { SignInButton, useUser } from "@clerk/nextjs";

import PageLayout from "~/components/layout";
import { LoadingSpinner } from "~/components/Loading";
import { PostsFeed } from "~/components/postView";
import { api } from "~/utils/api";

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
