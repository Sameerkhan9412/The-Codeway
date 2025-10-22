import React from 'react'
import { NavLink } from 'react-router-dom'

const ProblemCard = ({ problem }) => {
  return (
    <div className="bg-gray-800 rounded-md p-4 mt-2 hover:bg-gray-700 transition-colors duration-300 shadow-md">
      <div className="flex items-center justify-between">
        <NavLink to={`/problem/${problem._id}`} className="hover:text-orange-400 text-2xl font-semibold">
          {problem?.title}
        </NavLink>
        <span
          className={`text-sm font-semibold px-4 py-1 rounded-full ${
            problem.difficulty === "easy"
              ? "bg-green-400 text-white"
              : problem.difficulty === "medium"
              ? "bg-yellow-400 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {problem.difficulty}
        </span>
      </div>
      {problem.tags && problem.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {problem.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-orange-400 text-black text-xs font-semibold px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {problem.isSolved !== undefined && (
        <div className="mt-2">
          {problem.isSolved ? (
            <span className="text-green-400 font-semibold">Solved</span>
          ) : problem.isAttempting ? (
            <span className="text-yellow-400 font-semibold">Attempting</span>
          ) : (
            <span className="text-gray-400 font-semibold">Unsolved</span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProblemCard
