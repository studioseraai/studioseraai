import Studio from './studio';
import { workspacePage } from '../lib/workspace-ui';
export default async function Page({ searchParams }: {
    searchParams: Promise<{
        view?: string;
    }>;
}) { const query = await searchParams; return <Studio initialPage={workspacePage(query.view)}/>; }
