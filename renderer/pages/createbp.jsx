import { useState } from 'react'

import Head from 'next/head'
import Link from 'next/link'

import { books } from '@/helpers/books'
import { useTranslation } from '@/next-i18next'

function Create() {
  const { t } = useTranslation()
  const [fileUrl, setFileUrl] = useState('')
  const [resources, setResources] = useState([])

  const onSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    for (let [k, v] of data.entries()) {
      axios.get('https://git.door43.org/unfoldingWord')
      // надо скачать сначала манифесты, потом узнать и скачать файлы literal, simplified, twl, tn, tq
      // потом скачать архив, почистить вордсы
      // скачать полностью лексикон, академию
      // согласно literal создать структуру для книги с главами
      // надо ли все это делать на стороне апи или на клиенте. Ничего не мешает прям тут это провернуть, используя axios и jszip
    }
  }

  return (
    <>
      <Head>
        <title>{t('LEVEL')}</title>
      </Head>
      <div className="w-full p-4 text-lg">
        <Link href={`home`} legacyBehavior>
          <a className="rounded-md border bg-slate-300 px-3 py-2">{t('Back')}</a>
        </Link>
        <br />
        <h2 className="mb-4 mt-3 text-2xl">{t('CreateBP')}</h2>
        <p>{t('CreationRules')}</p>
        <form onSubmit={onSubmit}>
          <button
            className="mt-3 rounded-md border border-green-700 bg-green-600 px-3 py-2 text-base text-white shadow-md hover:border-green-800 hover:bg-green-700 active:bg-green-800"
            onClick={async (e) => {
              e.preventDefault()
              const { url, resources } = await window.electronAPI.openConfig()
              setFileUrl(url)
              setResources(resources)
            }}
          >
            {t('SelectProjectConfig')}
          </button>
          <input type="text" readOnly name="fileUrl" value={fileUrl} />
          {resources.length
            ? resources.map((resource) => (
                <div key={resource.name}>
                  <label className={resource.isMain ? 'font-bold' : ''}>
                    {resource.name}
                    <input name={resource.name} />
                  </label>
                </div>
              ))
            : ''}

          <br />
          <select name="bookKey">
            {books.map((el) => (
              <option key={el} value={el}>
                {el}
              </option>
            ))}
          </select>

          <input
            className="btn-primary mt-3 text-base"
            type="submit"
            value={t('Create')}
          />
        </form>
      </div>
    </>
  )
}

export default Create
