export interface IncrementConstraint {
  min: number;
  max: number;
  step: number;
}

export interface TimeConstraints {
  hours?: IncrementConstraint;
  minutes?: IncrementConstraint;
  seconds?: IncrementConstraint;
}
