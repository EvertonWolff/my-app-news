'use client'

import React, { useState, useEffect } from 'react'
import { Flame, Search } from 'lucide-react'

// Definir a interface para os artigos
interface Article {
  title: string
  description: string
  url: string
  urlToImage?: string // Campo opcional
  source: {
    name: string
  }
  publishedAt: string
}

// Função para buscar as notícias
const fetchNews = async (): Promise<Article[]> => {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_SERPAPI_KEY
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_news&q=api_key=${API_KEY}`
    )
    const data = await response.json()
    return data.articles || []
  } catch (error) {
    console.error('Erro ao buscar notícias:', error)
    return []
  }
}

// Componente do cartão de notícias
const NewsCard = ({
  article,
  onCardClick
}: {
  article: Article
  onCardClick: () => void
}) => (
  <div
    onClick={onCardClick}
    className="bg-white shadow-lg rounded-xl overflow-hidden transition-all hover:scale-105 cursor-pointer"
  >
    {article.urlToImage && (
      <img
        src={article.urlToImage}
        alt={article.title}
        className="w-full h-48 object-cover"
      />
    )}
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h2>
      <p className="text-gray-600 line-clamp-3 mb-4">{article.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{article.source.name}</span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
        >
          Leia Mais
        </a>
      </div>
    </div>
  </div>
)

// Modal para exibir os detalhes de uma notícia
const NewsDetailModal = ({
  article,
  onClose
}: {
  article: Article
  onClose: () => void
}) => {
  if (!article) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
        >
          X
        </button>
        {article.urlToImage && (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-96 object-cover rounded-t-xl"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">{article.source.name}</span>
            <span className="text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-4 text-lg">{article.description}</p>
          <div className="mt-6 flex justify-between items-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Ler Artigo Completo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente principal
export default function NewsBlog() {
  const [news, setNews] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true)
      try {
        const newsData = await fetchNews()
        setNews(newsData)
      } catch (error) {
        console.error('Erro ao carregar notícias:', error)
      } finally {
        setLoading(false)
      }
    }
    loadNews()
  }, [])

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Flame size={40} className="text-red-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                Notícias Hoje
              </h1>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={20} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Buscar notícias..."
                className="bg-transparent outline-none w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-xl">Carregando notícias...</div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center text-xl">Nenhuma notícia encontrada</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article, index) => (
              <NewsCard
                key={index}
                article={article}
                onCardClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  )
}
