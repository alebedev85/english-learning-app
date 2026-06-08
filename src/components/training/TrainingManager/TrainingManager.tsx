"use client";

import TrainingWelcome from "@/components/training/TrainingWelcome/TrainingWelcome";
import styles from "./TrainingManager.module.scss";

export default function TrainingManager() {

  return (
    <div className={styles.wrapper}>
      <TrainingWelcome currentProfile="Английский для начинающих" startTraining={() => {}} />
    </div>
  );
}
