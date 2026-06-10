"use client";

import { useAppSelector } from "@/store";
import { TrainingProvider, useTraining } from "@/components/training/context/TrainingContext";
import TrainingWelcome from "@/components/training/TrainingWelcome/TrainingWelcome";
import TrainingLayout from "@/components/training/TrainingLayout/TrainingLayout";
import StageCards from "@/components/training/StageCards/StageCards";
import styles from "./TrainingManager.module.scss";
import StageSelect from "../StageSelect/StageSelect";

function TrainingContent() {
  const { trainingSession, startTraining } = useTraining();
  
  const allWords = useAppSelector((state) => state.dictionary.words);

  const handleStart = () => {
    // Фильтруем слова согласно ТЗ: новые или в процессе изучения
    const wordsToTrain = allWords.filter(
      (word) => word.status === "new" || word.status === "learning"
    );

    // Ограничиваем сессию до 6 слов из ТЗ
    const sessionWords = wordsToTrain.slice(0, 6);

    if (sessionWords.length === 0) {
      alert("У вас нет новых слов или слов на изучении для запуска тренировки!");
      return;
    }

    startTraining(sessionWords);
  };

  return (
    <div className={styles.wrapper}>
      {!trainingSession ? (
        <TrainingWelcome
          currentProfile="Английский для начинающих"
          startTraining={handleStart}
        />
      ) : (
        <TrainingLayout>
          {trainingSession.stage === 1 && <StageCards />}
          {trainingSession.stage === 2 && <StageSelect />}
        </TrainingLayout>
      )}
    </div>
  );
}

export default function TrainingManager() {
  return (
    <TrainingProvider>
      <TrainingContent />
    </TrainingProvider>
  );
}