import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

const getNodeData = (node) => {
  const { selectionSet } = node || {};

  let fields = null;
  if (!!selectionSet) {
    fields = {};
    selectionSet.selections.forEach((selection) => {
      const name = selection.name.value;
      fields[name] = getNodeData(selection);
    });
  }

  return fields || true;
};

export const FieldMap = createParamDecorator((_, ctx: ExecutionContext) => {
  const gqlCtx = GqlExecutionContext.create(ctx);
  const info = gqlCtx.getInfo();

  const node = info.fieldNodes[0];
  return getNodeData(node);
});
