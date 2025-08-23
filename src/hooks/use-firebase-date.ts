import { db } from '@/lib/firebase';
import { Habit, Project, ProjectPayment,  } from '@/types';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export const useFirestoreData = (userId: string) => {
    console.log(userId)
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectPayments, setProjectPayments] = useState<ProjectPayment[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    // const [sales, setSales] = useState<SalesType[]>([]);
    // const [returns, setReturns] = useState<ReturnTransaction[]>([]);
    // const [customers, setCustomers] = useState<CustomerType[]>([]);
    // const [dues, setDues] = useState<DuesType[]>([])
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // console.log(userId)

        const fetchData = () => {
            setLoading(true);
            setError(null);

            const uid = userId;

            if (!uid) return;

            const handleSnapshot = (colName: string, setState: (data: any[]) => void) => {
                const q = query(collection(db, colName), where('userId', '==', uid)
                );
                return onSnapshot(q, (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        docId: doc.id,
                        ...doc.data()
                    })).sort((a:any, b:any) => {
                        const aTime = a.createdAt?.seconds ?? 0;
                        const bTime = b.createdAt?.seconds ?? 0;
                        return bTime - aTime; // newest first
                    });
                    setState(data);
                }, handleError);
            };

            const unsubscribeUser = handleSnapshot('users', setUsers); // Optional: depends on access model
            const unsubscribeProjects = handleSnapshot('projects', setProjects);
            const unsubscribeProjectPayments = handleSnapshot('projectPayments', setProjectPayments);
            const unsubscribeHabits = handleSnapshot('habits', setHabits);
            // const unsubscribeCustomers = handleSnapshot('customers', setCustomers);
            // const unsubscribeDues = handleSnapshot('dues', setDues);
            // const unsubscribeSales = handleSnapshot('sales', setSales);
            // const unsubscribeReturns = handleSnapshot('returns', setReturns);

            setLoading(false);

            return () => {
                unsubscribeUser?.();
                unsubscribeProjects?.();
                unsubscribeProjectPayments?.();
                unsubscribeHabits?.();
              
            };
        };



        if (userId) {
            fetchData()
        }
    }, [userId]);

    const handleError = (error: any) => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data.');
        setLoading(false);
    };

    return { users, loading, error, projects,projectPayments ,habits};
};