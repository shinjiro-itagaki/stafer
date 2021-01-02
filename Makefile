
all:
	npm run build

clean:
	./node_modules/.bin/tsc clean

start:
	./node_modules/.bin/serve -s ./public

.PHONY: clean start
