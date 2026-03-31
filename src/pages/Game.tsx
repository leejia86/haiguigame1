import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Game() {
  const navigate = useNavigate()

  // 重定向到首页，因为游戏需要通过具体的故事ID进入
  useEffect(() => {
    navigate('/')
  }, [navigate])

  return null
}

