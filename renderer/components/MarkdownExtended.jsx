import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import 'github-markdown-css/github-markdown-light.css'

export const fixUrl = (content) => {
  if (!content) {
    return
  }
  const links = content.match(/\[{2}\S+\]{2}/g)
  if (!links) {
    return content
  }
  let contentWithUrl = content

  links.forEach((el) => {
    const changeUrl = contentWithUrl
      .replace('[[', `[${el.replace(/\[{2}|\]{2}/g, '')}](`)
      .replace(']]', ')')
    contentWithUrl = changeUrl
  })

  return contentWithUrl
}

function MarkdownExtended({ children }) {
  // const content = (typeof children === 'string' ? fixUrl(children) : '')
  const content = (typeof children === 'string' ? children : '')
    .replace(/< *br *\/?>/gi, '\n')
    .replaceAll('\\n', '\n')
  // .replaceAll('rc://', 'http://');

  const convertYoutube = (props) => {
    function getVideoID(userInput) {
      var res = userInput.match(
        /^.*(?:(?:youtu.be\/)|(?:v\/)|(?:\/u\/\w\/)|(?:embed\/)|(?:watch\?))\??v?=?([^#\&\?]*).*/
      )
      if (res) return res[1]
      return false
    }
    const youtubeId = getVideoID(props?.href)
    if (youtubeId) {
      return (
        <iframe
          src={`https://youtube.com/embed/${youtubeId}`}
          frameBorder="0"
          allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
          allowFullScreen
          style={{
            width: '100%',
            aspectRatio: '16/9',
            outline: 'none',
          }}
        ></iframe>
      )
    }

    if (props.href.indexOf('tn/help/') > 0) {
      return <b>{props.children}</b>
    }
    // надо проверить что ссылка ведет именно на академию. Из материалов будет скорее всего абсолютная ссылка, но внутри академии будут скорее всего относительные. Надо это учесть. Можно записать все папки. У академии и у вордсов они отличаются
    return (
      <a
        href={props.href}
        onClick={(e) => {
          e.preventDefault()
          alert(props.href)
        }}
      >
        {props.children}
      </a>
    )
  }

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      className={`markdown-body`}
      components={{
        a: convertYoutube,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownExtended
