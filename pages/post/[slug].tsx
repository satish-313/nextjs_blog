import React from "react";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { allSlug, PostDetail } from "../../service";
import { Post } from "../../typings";
import { Loading } from "../../components";
import moment from "moment";

interface Props {
  post: Post;
}

const Post: NextPage<Props> = ({ post }) => {
  const router = useRouter();

  const getContentFragment = (index: any, text: any, obj: any, type: any) => {
    let modifiedText = text;

    if (obj) {
      if (obj.bold) {
        modifiedText = <b key={index}>{text}</b>;
      }

      if (obj.italic) {
        modifiedText = <em key={index}>{text}</em>;
      }

      if (obj.bold && obj.italic) {
        modifiedText = (
          <b key={index}>
            <em>{text}</em>
          </b>
        );
      }

      if (obj.underline) {
        modifiedText = <u key={index}>{text}</u>;
      }

      if (obj.type === "link") {
        modifiedText = (
          <a href={obj.href} target="_blank">
            {obj.children[0].text}
          </a>
        );
      }

      if (obj.code) {
        modifiedText = <code>{text}</code>;
      }

      if (obj.type === "list-item") {
        modifiedText = obj.children[0].children[0].text;
      }
    }

    switch (type) {
      case "numbered-list":
        return (
          <ol className="mb-5 list-decimal ml-5 -mt-3 font-mono" key={index}>
            {modifiedText.map((item: any, i: any) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      case "bulleted-list":
        return (
          <ul className="list-disc mb-5 ml-5 -mt-3 text-md font-medium font-mono" key={index}>
            {modifiedText.map((item: any, i: any) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      case "code-block":
        return (
          <pre key={index}>
            <code>
              {modifiedText.map((item: any, i: any) => (
                <React.Fragment key={i}>{item}</React.Fragment>
              ))}
            </code>
          </pre>
        );
      case "block-quote":
        return (
          <blockquote key={index}>
            {modifiedText.map((item: any, i: any) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </blockquote>
        );
      case "heading-three":
        return (
          <h3 key={index} className="text-xl font-semibold mb-4 font-mono">
            {modifiedText.map((item: any, i: any) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h3>
        );
      case "paragraph":
        return (
          <p key={index} className="mb-4 text-lg font-medium font-mono">
            {modifiedText.map((item: any, i: any) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </p>
        );
      case "heading-four":
        return (
          <h4 key={index} className="text-2xl font-semibold mb-4 font-mono">
            {modifiedText.map((item: any, i: any) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h4>
        );
      case "heading-five":
        return (
          <h5 key={index} className="text-md text-2xl font-semibold mb-4 font-mono">
            {modifiedText.map((item: any, i: number) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h5>
        );
      case "heading-six":
        return (
          <h6 key={index} className="text-md text-xl font-semibold mb-4 font-mono">
            {modifiedText.map((item: any, i: number) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h6>
        );
      case "image":
        return (
          <img
            className="mb-5"
            key={index}
            alt={obj.title}
            height={obj.height}
            width={obj.width}
            src={obj.src}
          />
        );
      default:
        return modifiedText;
    }
  };

  if (router.isFallback) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto my-5 px-5">
      <Head>
        <title>{post.title}</title>
        <link rel="icon" href="/logo_photo.jpg" />
      </Head>
      <div className="flex items-center space-x-4 my-2">
        <img
          className="w-10 h-10 rounded-full"
          src={post.author.picture.url}
          alt={post.author.name}
        />
        <div className="flex flex-col">
          <span>{post.author.name}</span>
          <p className="text-xs text-gray-600">
            published -{" "}
            <span>{moment(post.createdAt).format("MMM Do YY")}</span>
          </p>
        </div>
      </div>
      <div className="mb-20">
        <h3 className="font-bold text-3xl mb-2 font-mono">{post.title}</h3>
        <div className="w-2/3 h-2/3 m-3 mx-auto">
          <img src={post.coverImage.url} alt="image" />
        </div>
        {post.content.raw.children.map((typeObj: any, index: any) => {
          const children = typeObj.children.map((item: any, itemIndex: any) =>
            getContentFragment(itemIndex, item.text, item, undefined)
          );
          return getContentFragment(index, children, typeObj, typeObj.type);
        })}
      </div>
    </div>
  );
};

export default Post;

export const getStaticPaths = async () => {
  const posts: Post[] = await allSlug();

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let post;
  if (params !== undefined) post = await PostDetail(params.slug as string);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: { post },
    revalidate: 60 * 60 * 24,
  };
};
