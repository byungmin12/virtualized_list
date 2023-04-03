import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import "./App.css"

const url = "https://dummyjson.com/comments?limit=340";

function VirtualizedList () {
    const gap = 12;
    const pageItemCnt =  12
    const itemRef = useRef<HTMLDivElement>(null)
    const [list, setList] = useState<{ body: string, id: number, }[]>([]);
    const [listCnt , setListCnt] = useState(0)
    const [viewHeight,setViewHeight] = useState(0)
    const itemHeight = useMemo(() => {
        console.log(itemRef.current === null , list.length <=0,listCnt )
        if(itemRef.current === null || list.length <=0 )return 80 //initial height
        setListCnt(list.length * (itemRef.current.getBoundingClientRect().height + gap) )
        return itemRef.current.getBoundingClientRect().height + gap
    }, [itemRef,list]);

    const [range , setRange] = useState<[number,number]>([0,pageItemCnt])

    const handlerSetViewHeight = () => {
        setViewHeight(window.innerHeight)
    }

    const handlerScroll = (e:React.UIEvent) => {
        const firstRange = Math.floor(e.currentTarget.scrollTop/(itemHeight))
        const lastRange = Math.min(list.length ,Math.ceil((e.currentTarget.scrollTop+viewHeight)/itemHeight))
        setRange(()=>[firstRange, lastRange])
    }

    useEffect(() => {
        fetch(url)
            .then((res) => res.json())
            .then((resJson) => {
                setList(resJson.comments);
            });

        const setInitHeight = () => {
            handlerSetViewHeight()
        }
        window.addEventListener("resize",setInitHeight)
        return () => {
            window.removeEventListener("resize",setInitHeight)
        };
    }, []);

    useLayoutEffect(() => {
        handlerSetViewHeight()
    },[]);

    console.log(range,itemHeight)
    return <div className="Container" style={{gap }} onScroll={handlerScroll}>
        <div className="View" style={{  height: `${listCnt}px` }}>
            {list.length <= 0 ? (
                <div>게시글이 없습니다.</div>
            ) : (
                list.slice(range[0],range[1]).map((comment,idx) => <div key={comment.id} className="item" ref={itemRef}
                style={{top: `${(idx + range[0])  * itemHeight}px`}}
                >{idx + 1 + range[0] } {comment.body}</div>)
            )}
        </div>
    </div>
}

export default function App() {


    return (
        <div className="App">
            <VirtualizedList />
        </div>
    );
}
