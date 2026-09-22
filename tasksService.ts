import { getAccessToken, signInWithGoogle } from './firebase';

export async function createGoogleTaskList(title: string): Promise<string> {
  let token = await getAccessToken();
  if (!token) {
    const result = await signInWithGoogle();
    // getAccessToken() should yield the token after sign in, or fetch from credential
    token = await getAccessToken();
  }
  if (!token) throw new Error('Authentication required for Google Tasks.');

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create task list');
  const data = await res.json();
  return data.id as string;
}

export async function createGoogleTask(taskListId: string, title: string, notes?: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required for Google Tasks.');

  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, notes }),
  });
  if (!res.ok) throw new Error('Failed to create task');
}

export async function exportPlanToGoogleTasks(planText: string, listTitle: string): Promise<void> {
  // Try to parse out the steps from the plan text.
  // We'll create a task list and add each step as a task.
  
  // Split lines and try to find bullet points or numbered lists
  const lines = planText.split('\n').filter(line => line.trim().length > 0);
  const tasksToAdd: { title: string; notes: string }[] = [];
  
  tasksToAdd.push({
    title: "Review Complete Growth Plan",
    notes: planText.substring(0, 8000) // limit notes size
  });

  // Basic parsing for line items starting with 1., 2., -, *, etc.
  for (const line of lines) {
    if (/^(\d+\.|\-|\*)\s/.test(line.trim())) {
      const taskTitle = line.replace(/^(\d+\.|\-|\*)\s/, '').trim();
      if (taskTitle) {
        tasksToAdd.push({ title: taskTitle.substring(0, 200), notes: '' });
      }
    }
  }

  const listId = await createGoogleTaskList(listTitle);
  
  for (const task of tasksToAdd) {
    await createGoogleTask(listId, task.title, task.notes);
  }
}
