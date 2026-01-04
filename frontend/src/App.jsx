import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className="fixed inset-0 pointer-events-none -z-20 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-secondary rounded-full blur-[150px] animate-pulse delay-700" />
      </div>
    </div>
  )
}

export default App
