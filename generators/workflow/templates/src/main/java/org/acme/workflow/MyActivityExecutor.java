package org.acme.workflow;

import com.symphony.bdk.workflow.engine.executor.ActivityExecutor;
import com.symphony.bdk.workflow.engine.executor.ActivityExecutorContext;

import org.apache.commons.text.CaseUtils;

/**
 * An example of an activity's executor that transforms an input parameter and sets it as an output.
 */
public class MyActivityExecutor implements ActivityExecutor<MyActivity> {

  @Override
  public void execute(ActivityExecutorContext<MyActivity> context) {
    context.setOutputVariable("myOutput", CaseUtils.toCamelCase(context.getActivity().getMyParameter(), true));
  }
}
