import time

from snowflake import SnowflakeGenerator

t = time.time()

work_id = int(round(t * 1000)) % 1024

gen = SnowflakeGenerator(work_id)


def get_snowflake_id() -> int:
    result = next(gen)
    if result is not None:
        return int(result)
    raise ValueError("SnowflakeGenerator returned None")


if __name__ == "__main__":
    print(len(str(get_snowflake_id())))
