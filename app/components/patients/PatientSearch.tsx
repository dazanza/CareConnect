import { useState } from 'react'

interface PatientSearchProps {
  onSearch: (term: string) => void
}

export default function PatientSearch({ onSearch }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search patients..."
        className="border p-2 rounded mr-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Search
      </button>
    </form>
  )
}