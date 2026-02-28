import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, XCircle, ChevronRight, Award, Loader2, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const FlashQuiz = ({ noteId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [currentStep, setCurrentStep] = useState(0); // 0 = start, 1 = quiz, 2 = results
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        fetchQuiz();
    }, [noteId]);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/notes/${noteId}/quiz`);
            if (res.data.success) {
                setQuizData(res.data.data.questions);
            }
        } catch (err) {
            toast.error('Failed to generate Neural Sync Quiz');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (index) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        const isCorrect = index === quizData?.[currentQuestion]?.correctIndex;
        if (isCorrect) setScore(s => s + 1);

        setAnswers([...answers, {
            question: currentQuestion,
            selected: index,
            correct: quizData?.[currentQuestion]?.correctIndex,
            isCorrect
        }]);
    };

    const nextQuestion = () => {
        if (currentQuestion < (quizData?.length || 0) - 1) {
            setCurrentQuestion(c => c + 1);
            setSelectedOption(null);
        } else {
            setCurrentStep(2);
        }
    };

    const syncToNeuralNetwork = async () => {
        try {
            const points = score * 50;
            // Record completion and award reputation on the backend
            await api.put(`/notes/${noteId}/quiz/complete`, { score });

            toast.success(`Successfully Synced! +${points} Neural Points Awarded.`);
            onClose();
        } catch (err) {
            toast.error('Failed to sync neural results');
        }
    };

    // Use Portal to ensure the modal is fixed to the viewport, not the parent container
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="glass-frost w-[95%] max-w-2xl rounded-2xl overflow-hidden border border-primary/20 shadow-2xl relative max-h-[92vh] flex flex-col"
            >
                {/* Header Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 z-30" />

                <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <Brain size={48} className="text-primary animate-pulse" />
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Synchronizing Neural Logic...</p>
                        </div>
                    ) : currentStep === 0 ? (
                        <div className="text-center space-y-6 py-4 sm:py-8">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-primary/30">
                                <Brain size={32} className="sm:size-[40px] text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[18px] sm:text-[20px] font-bold text-foreground leading-tight">Neural sync: Spaced Repetition</h3>
                                <p className="text-[12px] sm:text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                                    Validate your understanding of this technical record to earn **Logic Rep** and lock the concepts into your permanent memory.
                                </p>
                            </div>
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="so-btn so-btn-primary px-8 sm:px-10 py-3 font-bold group w-full sm:w-auto mt-4"
                            >
                                Initiate Sync <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : currentStep === 1 ? (
                        <div className="space-y-6 sm:space-y-8">
                            {/* Quiz Progress */}
                            <div className="flex justify-between items-center bg-card/30 p-2 rounded-lg border border-border/40">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Question {currentQuestion + 1} / {quizData?.length || 0}</span>
                                <div className="flex gap-1.5">
                                    {quizData?.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 w-6 sm:w-8 rounded-full transition-all duration-300 ${i === currentQuestion ? 'bg-primary' :
                                                i < currentQuestion ? 'bg-primary/40' : 'bg-border/60'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {!quizData ? (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground italic">Neural synchronization failed. Retrying...</p>
                                    <button onClick={fetchQuiz} className="mt-4 so-btn border text-xs uppercase font-black">Refresh Logic</button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h4 className="text-[16px] sm:text-[19px] font-bold text-foreground leading-snug">
                                        {quizData?.[currentQuestion]?.question}
                                    </h4>

                                    <div className="grid grid-cols-1 gap-3">
                                        {quizData?.[currentQuestion]?.options?.map((option, i) => {
                                            const isSelected = selectedOption === i;
                                            const isCorrect = i === quizData?.[currentQuestion]?.correctIndex;
                                            const showResult = selectedOption !== null;

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAnswer(i)}
                                                    disabled={showResult}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group relative overflow-hidden ${!showResult ? 'bg-background hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]' :
                                                        isSelected && isCorrect ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                                                            isSelected && !isCorrect ? 'bg-destructive/10 border-destructive/50 text-destructive' :
                                                                isCorrect ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-muted/50 border-border opacity-50'
                                                        }`}
                                                >
                                                    <span className="text-[13px] sm:text-[14px] font-medium z-10">{option}</span>
                                                    <div className="z-10 flex shrink-0 ml-4">
                                                        {showResult && isCorrect && <CheckCircle2 size={18} className="text-green-500" />}
                                                        {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-destructive" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <AnimatePresence>
                                        {selectedOption !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-4 pt-4 border-t border-border/40"
                                            >
                                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                                    <p className="text-[11px] sm:text-[12px] text-foreground leading-relaxed">
                                                        <span className="font-black text-primary uppercase mr-2 text-[10px] tracking-widest">System Logic:</span>
                                                        {quizData?.[currentQuestion]?.explanation}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={nextQuestion}
                                                    className="w-full so-btn so-btn-primary py-4 font-black uppercase tracking-widest text-[11px]"
                                                >
                                                    {currentQuestion === (quizData?.length || 0) - 1 ? 'Final Commit' : 'Advance Next'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center space-y-6 py-2">
                            <div className="relative inline-block">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 10 }}
                                    className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary"
                                >
                                    <Award size={40} className="sm:size-[48px] text-primary" />
                                </motion.div>
                                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Validated
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[20px] sm:text-[24px] font-black text-foreground mb-1 leading-tight uppercase tracking-tight">Sync Complete</h3>
                                <div className="text-[11px] sm:text-[13px] text-muted-foreground uppercase font-black tracking-widest flex items-center justify-center gap-2">
                                    <span className="opacity-50">Score:</span>
                                    <span className="text-primary text-base">{score} / {quizData?.length || 0}</span>
                                    <span className="opacity-50">Accuracy</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                <div className="p-3 sm:p-4 rounded-2xl bg-muted/30 border border-border">
                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black mb-1 opacity-60 text-center">Logic Rep</p>
                                    <p className="text-[14px] sm:text-[18px] font-black text-foreground text-center">+{score * 10}</p>
                                </div>
                                <div className="p-3 sm:p-4 rounded-2xl bg-muted/30 border border-border">
                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black mb-1 opacity-60 text-center">Accuracy Pts</p>
                                    <p className="text-[14px] sm:text-[18px] font-black text-foreground text-center">+{score * 5}</p>
                                </div>
                                <div className="p-3 sm:p-4 rounded-2xl bg-muted/30 border border-border">
                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black mb-1 opacity-60 text-center">Status</p>
                                    <p className="text-[14px] sm:text-[18px] font-black text-primary text-center">COMMITTED</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={syncToNeuralNetwork}
                                    className="flex-1 so-btn so-btn-primary py-4 font-black uppercase tracking-widest order-2 sm:order-1 text-[11px]"
                                >
                                    Commit to Neural Record
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentStep(0);
                                        setCurrentQuestion(0);
                                        setSelectedOption(null);
                                        setScore(0);
                                        fetchQuiz();
                                    }}
                                    className="p-3 bg-secondary rounded-xl border border-border hover:bg-border/50 transition-all flex items-center justify-center order-1 sm:order-2"
                                >
                                    <RefreshCcw size={20} className="text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all z-40 bg-background/50 backdrop-blur-sm"
                >
                    <XCircle size={22} />
                </button>
            </motion.div>
        </div>,
        document.body
    );
};

export default FlashQuiz;
