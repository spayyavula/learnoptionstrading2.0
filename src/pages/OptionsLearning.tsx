import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  AlertTriangle,
  CheckCircle, 
  Play, 
  Lock,
  Star,
  Target,
  Brain,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react'
import { LearningService } from '../services/learningService'
import type { LearningModule, LearningProgress } from '../types/learning'

export default function OptionsLearning() {
  const [modules, setModules] = useState<LearningModule[]>([])
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
  const [currentContent, setCurrentContent] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  useEffect(() => {
    LearningService.initializeDefaultData()
    loadData()
  }, [])

  const loadData = () => {
    setModules(LearningService.getLearningModules())
    setProgress(LearningService.getLearningProgress())
  }

  const handleStartModule = (module: LearningModule) => {
    setSelectedModule(module)
    setCurrentContent(0)
    setShowQuiz(false)
    setQuizAnswers({})
    setQuizSubmitted(false)
  }

  const handleNextContent = () => {
    if (selectedModule && currentContent < selectedModule.content.length - 1) {
      setCurrentContent(currentContent + 1)
    } else if (selectedModule?.quiz) {
      setShowQuiz(true)
    } else {
      handleCompleteModule()
    }
  }

  const handlePrevContent = () => {
    if (currentContent > 0) {
      setCurrentContent(currentContent - 1)
    }
  }

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitQuiz = () => {
    if (!selectedModule?.quiz) return

    let correctAnswers = 0
    selectedModule.quiz.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctAnswer.toString()) {
        correctAnswers++
      }
    })

    const score = (correctAnswers / selectedModule.quiz.questions.length) * 100
    setQuizSubmitted(true)

    if (score >= selectedModule.quiz.passingScore) {
      setTimeout(() => {
        handleCompleteModule(score)
      }, 2000)
    }
  }

  const handleCompleteModule = (score?: number) => {
    if (!selectedModule) return

    LearningService.completeModule(selectedModule.id, score)
    loadData()
    setSelectedModule(null)
  }

  const isModuleUnlocked = (module: LearningModule): boolean => {
    if (!progress) return false
    return module.prerequisites.every(prereq => 
      progress.completedModules.includes(prereq)
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const stats = LearningService.getLearningStats()

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Module Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedModule(null)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Learning Path
              </button>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedModule.difficulty)}`}>
                {selectedModule.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedModule.title}</h1>
            <p className="text-gray-600 mb-4">{selectedModule.description}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: showQuiz 
                    ? '100%' 
                    : `${((currentContent + 1) / selectedModule.content.length) * 100}%` 
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {showQuiz 
                ? 'Quiz Time!' 
                : `${currentContent + 1} of ${selectedModule.content.length}`
              }
            </p>
          </div>

          {/* Content */}
          {!showQuiz ? (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedModule.content[currentContent].title}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedModule.content[currentContent].content}
                  </p>
                </div>

                {selectedModule.content[currentContent].type === 'example' && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Example</h3>
                    <p className="text-blue-800">{selectedModule.content[currentContent].content}</p>
                  </div>
                )}

                {selectedModule.content[currentContent].type === 'interactive' && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      Interactive Exercise
                    </h3>
                    <p className="text-purple-800 mb-4">{selectedModule.content[currentContent].content}</p>
                    <button className="btn btn-primary">
                      Open Options Chain →
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={handlePrevContent}
                  disabled={currentContent === 0}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextContent}
                  className="btn btn-primary"
                >
                  {currentContent === selectedModule.content.length - 1 
                    ? (selectedModule.quiz ? 'Take Quiz' : 'Complete Module')
                    : 'Next'
                  }
                </button>
              </div>
            </div>
          ) : (
            /* Quiz */
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                  Knowledge Check
                </h2>

                {selectedModule.quiz?.questions.map((question, index) => (
                  <div key={question.id} className="mb-8 p-6 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {index + 1}. {question.question}
                    </h3>

                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                              className="h-4 w-4 text-blue-600"
                              disabled={quizSubmitted}
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div className="space-y-2">
                        {['True', 'False'].map((option) => (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                              className="h-4 w-4 text-blue-600"
                              disabled={quizSubmitted}
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'numerical' && (
                      <input
                        type="number"
                        step="0.01"
                        onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                        className="form-input w-32"
                        disabled={quizSubmitted}
                      />
                    )}

                    {quizSubmitted && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        quizAnswers[question.id] === question.correctAnswer.toString()
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <p className={`font-medium ${
                          quizAnswers[question.id] === question.correctAnswer.toString()
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}>
                          {quizAnswers[question.id] === question.correctAnswer.toString()
                            ? '✓ Correct!'
                            : `✗ Incorrect. Correct answer: ${question.correctAnswer}`
                          }
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}

                {!quizSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < (selectedModule.quiz?.questions.length || 0)}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    Submit Quiz
                  </button>
                )}

                {quizSubmitted && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">
                      Quiz completed! 
                      {selectedModule.quiz && 
                        (Object.values(quizAnswers).filter((answer, index) => 
                          answer === selectedModule.quiz!.questions[index].correctAnswer.toString()
                        ).length / selectedModule.quiz.questions.length) * 100 >= selectedModule.quiz.passingScore
                        ? ' You passed! 🎉'
                        : ' You need to retake this quiz to continue.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Educational Disclaimer */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Learning-Focused Approach</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Our educational content is designed to help you develop trading expertise, not to maximize profits.
                Focus on understanding concepts, building skills, and developing your own trading approach.
              </p>
              <p className="mt-1">
                The goal is to become a knowledgeable trader through practice and continuous learning, not to make quick profits.
                Take time to master each concept before moving to the next level.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="card shadow-md border-blue-200">
        <div className="card-header bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trading Expertise Development Path</h2>
              <p className="text-gray-600 mt-2">
                Develop trading expertise through our comprehensive, structured learning program
              </p>
            </div>
            <BookOpen className="h-12 w-12 text-blue-700" />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card shadow-md border-blue-200">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
                <p className="text-sm text-gray-500">{stats.completedModules}/{stats.totalModules} modules</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-md border-yellow-200">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Level</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentLevel}</p>
                <p className="text-sm text-gray-500">{progress?.experience || 0} XP</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-md border-green-200">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Knowledge Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageQuizScore.toFixed(0)}%</p>
                <p className="text-sm text-gray-500">Your learning progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-md border-purple-200">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Skill Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.achievements}</p>
                <p className="text-sm text-gray-500">Skills mastered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Modules */}
      <div className="card shadow-md border-blue-200">
        <div className="card-header bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-lg font-medium text-gray-900">Expertise Development Modules</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {modules.map((module) => {
              const isCompleted = progress?.completedModules.includes(module.id) || false
              const isUnlocked = isModuleUnlocked(module)
              const quizScore = progress?.quizScores[module.id]

              return (
                <div
                  key={module.id}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    isCompleted
                      ? 'border-green-200 bg-green-50'
                      : isUnlocked
                      ? 'border-blue-200 bg-blue-50 hover:border-blue-300'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {module.estimatedTime} min
                        </span>
                        <span className={`px-2 py-1 rounded-full ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                      </div>

                      {quizScore && (
                        <div className="mt-2">
                          <span className="text-xs text-green-600 font-medium">
                            Quiz Score: {quizScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {module.prerequisites.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.prerequisites.map((prereq) => {
                          const prereqModule = modules.find(m => m.id === prereq)
                          const isPrereqCompleted = progress?.completedModules.includes(prereq)
                          return (
                            <span
                              key={prereq}
                              className={`text-xs px-2 py-1 rounded ${
                                isPrereqCompleted
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {prereqModule?.title || prereq}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {module.objectives.length} learning objectives
                    </div>
                    <button
                      onClick={() => handleStartModule(module)}
                      disabled={!isUnlocked}
                      className={`btn ${
                        isCompleted
                          ? 'btn-secondary'
                          : isUnlocked
                          ? 'btn-primary'
                          : 'btn-secondary opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Play className="h-4 w-4" />
                      {isCompleted ? 'Review' : isUnlocked ? 'Start' : 'Locked'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {progress && progress.achievements.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Recent Achievements
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {progress.achievements.slice(-6).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}