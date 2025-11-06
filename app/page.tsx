export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Hobby Tracker</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to your hobby tracking application!
        </p>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-gray-700">
            This is your new hobby tracker. You can start adding your hobbies and tracking your progress.
          </p>
        </div>
      </div>
    </main>
  )
}
