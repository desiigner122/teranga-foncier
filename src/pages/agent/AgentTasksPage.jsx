import React, { useState, useEffect } from 'react';
const AgentTasksPage = () => {
  const { toast } = useToast();
  const { data: tasks, loading: tasksLoading, error: tasksError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (tasks) {
      setFilteredData(tasks);
    }
  }, [tasks]);
  
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: tasks } = await supabase
          .from('agent_tasks')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false });

        setTasks(tasks || [data, error]);
      } catch (error) {        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleToggleTask = async (taskId, current) => {
    try {
      const { data, error } = await supabase.from('agent_tasks').update({ completed: !current, updated_at: new Date().toISOString() }).eq('id', taskId).select().single();
      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? data : t));
    } catch (e) {
      toast({ variant:'destructive', title:'Erreur', description:'Impossible de mettre à jour la tâche.' });
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le titre de la tâche ne peut pas être vide.' });
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const insert = {
        agent_id: user.id,
        title: newTaskTitle.trim(),
        priority: 'Moyenne',
        due_date: new Date().toISOString().split('T')[0],
        completed: false,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('agent_tasks').insert([insert]).select().single();
      if (error) throw error;
      setTasks([data, ...tasks]);
      setNewTaskTitle('');
      toast({ title: 'Tâche ajoutée', description: insert.title });
    } catch (e) {
      toast({ variant:'destructive', title:'Erreur', description:'Impossible d\'ajouter la tâche.' });
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Haute': return 'destructive';
      case 'Moyenne': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const upcomingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Mes Tâches</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une nouvelle tâche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              placeholder="Ex: Appeler le client pour le dossier..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tâches à faire ({upcomingTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingTasks.map(task => (
                <li key={task.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                  <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => handleToggleTask(task.id, task.completed)} />
                  <label htmlFor={`task-${task.id}`} className="flex-grow cursor-pointer">
                    <span className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</span>
                    <div className="text-xs text-muted-foreground">
                      Échéance: {task.dueDate}
                    </div>
                  </label>
                  <Badge variant={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tâches terminées ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {completedTasks.map(task => (
                <li key={task.id} className="flex items-center space-x-3 p-2 rounded-md">
                  <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => handleToggleTask(task.id, task.completed)} />
                  <label htmlFor={`task-${task.id}`} className="flex-grow cursor-pointer">
                    <span className="line-through text-muted-foreground">{task.title}</span>
                  </label>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AgentTasksPage;
