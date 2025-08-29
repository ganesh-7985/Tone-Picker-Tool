import LRU from "lru-cache";

export const cache = new LRU({
    max: 500,
    ttl: 1000*60*10
})