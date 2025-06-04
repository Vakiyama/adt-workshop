import { useState } from 'react';

// Motivation: Avoid avoidable errors.


// Types should protect us from making mistakes.


function ExampleComponent() {
  const [selectedShapeIds, setSelectedShapeIds] = useState<number[] | null>(null)

  return (
    { selectedShapeIds === null ? <p>"" </p>}
  )
}


type Data = { data: string };
type Error = { error: string; status: number };

type QueryResult = {
  data: Data | undefined;
  error: Error | undefined;
  isLoading: boolean;
};

// What do we expect?
//
// Our data structure ALLOWS us to model data incorrectly.

/*
 
     Data        isLoading  Error        What is this called?
  
  1. undefined   false      undefined    ?
  2. Data        false      undefined    ?
  3. undefined   true       undefined    ?
  4. undefined   false      Error        ?

  // uh-oh

  5. Data        true       Error        ?
  6. Data        true       undefined    ?
  7. Data        false      Error        ?
  8. undefined   true       Error        ?
  
*/
