FROM debian
ADD https://raw.githubusercontent.com/jscad/OpenJSCAD.org/V1/packages/web/dist/min.js /ttgen/dist/

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

COPY src /ttgen/
RUN ls -R /ttgen
WORKDIR /ttgen

ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING='UTF-8'
